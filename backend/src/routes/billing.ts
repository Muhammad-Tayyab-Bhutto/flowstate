import { FastifyPluginAsync } from 'fastify';
import Stripe from 'stripe';
import { z } from 'zod';
import { config } from '../config/index.js';
import * as SharedConstants from '@flowstate/shared/constants';
import type { Subscription, PlanType } from '@flowstate/shared';

const { COLLECTIONS, PLAN_PRICES } = SharedConstants;

const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2023-10-16' });

const CheckoutSchema = z.object({ plan: z.enum(['STARTER', 'PRO']) });

export const billingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/subscription', { onRequest: [fastify.authenticate] }, async (request) => {
    const subSnapshot = await fastify.firestore
      .collection(COLLECTIONS.SUBSCRIPTIONS)
      .where('tenant_id', '==', request.user.tenant_id)
      .where('status', 'in', ['ACTIVE', 'TRIALING', 'PAST_DUE'])
      .limit(1)
      .get();

    if (subSnapshot.empty) return { success: true, data: null };

    return { success: true, data: { ...subSnapshot.docs[0]!.data(), id: subSnapshot.docs[0]!.id } };
  });

  fastify.post('/checkout', { onRequest: [fastify.authenticate] }, async (request) => {
    const body = CheckoutSchema.parse(request.body);
    let customerId = request.user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: request.user.email,
        name: request.user.name,
        metadata: { tenant_id: request.user.tenant_id, user_id: request.user.id },
      });
      customerId = customer.id;

      await fastify.firestore.collection(COLLECTIONS.USERS).doc(request.user.id).update({ stripe_customer_id: customerId });
    }

    const price = PLAN_PRICES[body.plan];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `FlowState ${body.plan} Plan`, description: `Monthly subscription` },
          unit_amount: price.monthly,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: { tenant_id: request.user.tenant_id, plan: body.plan },
      success_url: `${config.corsOrigin}/billing?success=true`,
      cancel_url: `${config.corsOrigin}/billing?canceled=true`,
    });

    return { success: true, data: { url: session.url } };
  });

  fastify.post('/portal', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (!request.user.stripe_customer_id) return reply.badRequest('No billing account found');

    const session = await stripe.billingPortal.sessions.create({
      customer: request.user.stripe_customer_id,
      return_url: `${config.corsOrigin}/billing`,
    });

    return { success: true, data: { url: session.url } };
  });

  fastify.post('/webhook', { config: { rawBody: true } }, async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      const rawBody = (request as unknown as { rawBody: Buffer }).rawBody;
      event = stripe.webhooks.constructEvent(rawBody, sig, config.stripeWebhookSecret);
    } catch (err) {
      fastify.log.error({ err }, 'Webhook signature verification failed');
      return reply.badRequest('Invalid signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.['tenant_id'];
        const plan = session.metadata?.['plan'] as PlanType | undefined;

        if (tenantId && plan && session.subscription) {
          const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);

          const subscription: Omit<Subscription, 'id'> = {
            tenant_id: tenantId,
            stripe_subscription_id: stripeSub.id,
            stripe_customer_id: session.customer as string,
            plan,
            status: 'ACTIVE',
            current_period_start: new Date(stripeSub.current_period_start * 1000),
            current_period_end: new Date(stripeSub.current_period_end * 1000),
            cancel_at_period_end: stripeSub.cancel_at_period_end,
            created_at: new Date(),
            updated_at: new Date(),
          };

          await fastify.firestore.collection(COLLECTIONS.SUBSCRIPTIONS).doc(stripeSub.id).set(subscription);
          await fastify.firestore.collection(COLLECTIONS.TENANTS).doc(tenantId).update({ plan, subscription_status: 'ACTIVE' });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await fastify.firestore.collection(COLLECTIONS.SUBSCRIPTIONS).doc(invoice.subscription as string).update({ status: 'ACTIVE', updated_at: new Date() });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subDoc = await fastify.firestore.collection(COLLECTIONS.SUBSCRIPTIONS).doc(invoice.subscription as string).get();
          if (subDoc.exists) {
            const sub = subDoc.data() as Subscription;
            await fastify.firestore.collection(COLLECTIONS.SUBSCRIPTIONS).doc(invoice.subscription as string).update({ status: 'PAST_DUE', updated_at: new Date() });
            await fastify.firestore.collection(COLLECTIONS.TENANTS).doc(sub.tenant_id).update({ subscription_status: 'PAST_DUE' });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subDoc = await fastify.firestore.collection(COLLECTIONS.SUBSCRIPTIONS).doc(subscription.id).get();
        if (subDoc.exists) {
          const sub = subDoc.data() as Subscription;
          await fastify.firestore.collection(COLLECTIONS.SUBSCRIPTIONS).doc(subscription.id).update({ status: 'CANCELED', updated_at: new Date() });
          await fastify.firestore.collection(COLLECTIONS.TENANTS).doc(sub.tenant_id).update({ plan: 'FREE', subscription_status: 'CANCELED' });
        }
        break;
      }
    }

    return { received: true };
  });
};
