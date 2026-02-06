import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimulatedSiteProps } from '@/lib/types';
import { Search } from 'lucide-react';

const providers = [
  { id: 'electric', name: 'City Electric Company', icon: '⚡' },
  { id: 'water', name: 'Metro Water Authority', icon: '💧' },
  { id: 'gas', name: 'Natural Gas Services', icon: '🔥' },
  { id: 'internet', name: 'FastNet Internet', icon: '📡' },
];

export function BillSite({ onAction, currentStep, isCalm, isFocusAssist }: SimulatedSiteProps) {
  const [step, setStep] = useState<'search' | 'payment' | 'review' | 'complete'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<typeof providers[0] | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  const filteredProviders = searchQuery 
    ? providers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : providers;

  const isTarget = (selector: string) => currentStep?.targetSelector === `[data-navai="${selector}"]`;

  return (
    <div className="min-h-full bg-background p-6">
      {/* Header */}
      <header className="bg-secondary rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/30 rounded-lg flex items-center justify-center text-xl">💳</div>
            <div>
              <h1 className="font-bold text-lg">QuickPay Portal</h1>
              <p className="text-xs text-muted-foreground">Fast & Secure Bill Payments</p>
            </div>
          </div>
          <nav className={`hidden md:flex gap-4 text-sm ${isCalm ? 'navai-distraction' : ''}`}>
            <span className="text-muted-foreground cursor-pointer hover:text-foreground">Dashboard</span>
            <span className="text-muted-foreground cursor-pointer hover:text-foreground">History</span>
            <span className="text-muted-foreground cursor-pointer hover:text-foreground">Settings</span>
            <span className="text-muted-foreground cursor-pointer hover:text-foreground">Help</span>
          </nav>
        </div>
      </header>

      <div className="flex gap-6">
        {/* Sidebar */}
        {!isFocusAssist && (
          <aside className={`hidden lg:block w-48 shrink-0 ${isCalm ? 'navai-distraction' : ''}`}>
            <div className="bg-secondary rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Recent Bills</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="cursor-pointer hover:text-foreground">Electric - $87.50</li>
                <li className="cursor-pointer hover:text-foreground">Water - $45.00</li>
                <li className="cursor-pointer hover:text-foreground">Internet - $79.99</li>
              </ul>
            </div>
            <div className="bg-secondary rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-sm mb-2">Promotions</h3>
              <p className="text-xs text-muted-foreground">Set up auto-pay and save 5%!</p>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 max-w-2xl">
          {/* Search step */}
          {step === 'search' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Find Your Provider</h2>
              
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-navai="provider-search"
                  placeholder="Search for your utility provider..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onAction('[data-navai="provider-search"]', true);
                  }}
                  className={`pl-10 ${isTarget('provider-search') ? 'ring-2 ring-primary' : ''}`}
                />
              </div>

              <div className="space-y-2">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider.id}
                    data-navai={provider.id === 'electric' ? 'provider-result' : undefined}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-secondary ${
                      isTarget('provider-result') && provider.id === 'electric' 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setStep('payment');
                      if (provider.id === 'electric') {
                        onAction('[data-navai="provider-result"]', true);
                      } else {
                        onAction('other-provider', false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <span className="font-medium">{provider.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment step */}
          {step === 'payment' && selectedProvider && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{selectedProvider.icon}</span>
                <h2 className="text-xl font-semibold">{selectedProvider.name}</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="account-number">Account Number *</Label>
                  <Input
                    id="account-number"
                    data-navai="account-number"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      onAction('[data-navai="account-number"]', true);
                    }}
                    placeholder="Enter your account number"
                    className={isTarget('account-number') ? 'ring-2 ring-primary' : ''}
                  />
                </div>
                
                <div>
                  <Label htmlFor="payment-amount">Payment Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="payment-amount"
                      data-navai="payment-amount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => {
                        setPaymentAmount(e.target.value);
                        onAction('[data-navai="payment-amount"]', true);
                      }}
                      placeholder="0.00"
                      className={`pl-7 ${isTarget('payment-amount') ? 'ring-2 ring-primary' : ''}`}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('search')}
                    className={isCalm ? 'navai-distraction' : ''}
                  >
                    Change Provider
                  </Button>
                  <Button
                    data-navai="review-payment"
                    className="btn-pill-primary"
                    disabled={!accountNumber || !paymentAmount}
                    onClick={() => {
                      setStep('review');
                      onAction('[data-navai="review-payment"]', true);
                    }}
                  >
                    Review Payment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Review step */}
          {step === 'review' && selectedProvider && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Review Payment</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{selectedProvider.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-medium">{accountNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium text-xl">${paymentAmount}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('payment')}
                  className={isCalm ? 'navai-distraction' : ''}
                >
                  Edit Payment
                </Button>
                <Button
                  data-navai="confirm-payment"
                  className="btn-pill-primary"
                  onClick={() => {
                    setStep('complete');
                    onAction('[data-navai="confirm-payment"]', true);
                  }}
                >
                  Confirm Payment
                </Button>
              </div>
            </div>
          )}

          {/* Complete step */}
          {step === 'complete' && (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-semibold mb-2">Payment Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Your payment of ${paymentAmount} to {selectedProvider?.name} has been processed.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setStep('search');
                  setSelectedProvider(null);
                  setAccountNumber('');
                  setPaymentAmount('');
                }}
              >
                Make Another Payment
              </Button>
            </div>
          )}

          {/* Ads / distractions */}
          {!isFocusAssist && (
            <div className={`mt-6 grid md:grid-cols-2 gap-4 ${isCalm ? 'navai-distraction' : ''}`}>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-sm mb-1">💳 Get Cashback</h4>
                <p className="text-xs text-muted-foreground">
                  Link your credit card and earn 2% cashback on all payments!
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-sm mb-1">📱 Download Our App</h4>
                <p className="text-xs text-muted-foreground">
                  Pay bills on the go. Available for iOS and Android.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
