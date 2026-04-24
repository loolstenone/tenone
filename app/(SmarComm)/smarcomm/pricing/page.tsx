import Link from 'next/link';
import { Check } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import Header from '@/features/smarcomm/Header';
import Footer from '@/features/smarcomm/Footer';

interface Plan {
  plan_key: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number | null;
  max_members: number | null;
  features: string[];
  is_popular: boolean;
}

async function getSmarCommPlans(): Promise<Plan[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('wio_subscription_plans')
    .select('plan_key, display_name, price_monthly, price_yearly, max_members, features, is_popular')
    .eq('service', 'smarcomm')
    .eq('is_active', true)
    .order('price_monthly');
  return (data ?? []) as Plan[];
}

function formatPrice(price: number) {
  if (price === 0) return '무료';
  return `${(price / 10000).toLocaleString('ko-KR')}만 원`;
}

function getCTA(plan: Plan): { label: string; href: string } {
  if (plan.plan_key === 'business') return { label: '문의하기', href: '/meeting' };
  if (plan.plan_key === 'free') return { label: '무료 시작', href: '/signup' };
  return { label: '시작하기', href: '/signup' };
}

export default async function PricingPage() {
  const plans = await getSmarCommPlans();

  return (
    <>
      <Header />
      <main className="min-h-screen px-5 pb-20 pt-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-extrabold text-text">요금제</h1>
            <p className="text-base text-text-sub">무료로 시작하고, 성장에 맞춰 업그레이드하세요</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const cta = getCTA(plan);
              return (
                <div
                  key={plan.plan_key}
                  className={`flex flex-col rounded-2xl border p-6 ${
                    plan.is_popular
                      ? 'border-accent bg-accent/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                      : 'border-border bg-card'
                  }`}
                >
                  {plan.is_popular && (
                    <div className="mb-3 text-xs font-bold tracking-wider text-accent">추천</div>
                  )}
                  <h3 className="text-lg font-extrabold text-text">{plan.display_name}</h3>
                  {plan.max_members && (
                    <p className="mb-1 text-xs text-text-muted">최대 {plan.max_members}명</p>
                  )}
                  <div className="mb-4 mt-2">
                    <span className="text-2xl font-extrabold text-text">{formatPrice(plan.price_monthly)}</span>
                    {plan.price_monthly > 0 && (
                      <span className="text-sm text-text-muted">/월</span>
                    )}
                  </div>

                  <div className="mb-6 flex-1 space-y-2">
                    {(plan.features ?? []).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check size={14} className="shrink-0 text-success" />
                        <span className="text-text-sub">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={cta.href}
                    className={`block rounded-lg py-2.5 text-center text-sm font-bold transition-colors ${
                      plan.is_popular
                        ? 'bg-accent text-white hover:bg-accent/90'
                        : 'border border-border bg-surface text-text-sub hover:text-text'
                    }`}
                  >
                    {cta.label}
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-text-muted">
              Enterprise 요금제가 필요하신가요?{' '}
              <Link href="/meeting" className="font-medium text-accent">
                문의하기
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
