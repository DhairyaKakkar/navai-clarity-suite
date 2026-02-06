import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SimulatedSiteProps } from '@/lib/types';

const fieldToKey: Record<string, string> = {
  'first-name': 'firstName',
  'last-name': 'lastName',
  'dob': 'dob',
  'address': 'address',
  'city': 'city',
  'state': 'state',
};

export function LicenseSite({ onAction, currentStep, isCalm, isFocusAssist }: SimulatedSiteProps) {
  const [started, setStarted] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    uploadedFile: false,
    confirmed: false,
  });

  const handleInputChange = (navaiField: string, value: string) => {
    const stateKey = fieldToKey[navaiField] || navaiField;
    setFormData(prev => ({ ...prev, [stateKey]: value }));
    onAction(`[data-navai="${navaiField}"]`, true);
  };

  const isTarget = (selector: string) => currentStep?.targetSelector === `[data-navai="${selector}"]`;

  return (
    <div className="min-h-full bg-background p-6">
      {/* Fake government header */}
      <header className="bg-secondary rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/30 rounded-full" />
            <div>
              <h1 className="font-bold text-lg">State Department of Motor Vehicles</h1>
              <p className="text-xs text-muted-foreground">Driver License Services Portal</p>
            </div>
          </div>
          <nav className={`hidden md:flex gap-4 text-sm ${isCalm ? 'navai-distraction' : ''}`}>
            <span className="text-muted-foreground cursor-pointer hover:text-foreground">Home</span>
            <span className="text-muted-foreground cursor-pointer hover:text-foreground">Vehicle Registration</span>
            <span className="text-muted-foreground cursor-pointer hover:text-foreground">ID Cards</span>
            <span className="text-muted-foreground cursor-pointer hover:text-foreground">Contact</span>
          </nav>
        </div>
      </header>

      <div className="flex gap-6">
        {/* Sidebar - distraction */}
        {!isFocusAssist && (
          <aside className={`hidden lg:block w-48 shrink-0 ${isCalm ? 'navai-distraction' : ''}`}>
            <div className="bg-secondary rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="cursor-pointer hover:text-foreground">Renew License</li>
                <li className="cursor-pointer hover:text-foreground">Replace Lost ID</li>
                <li className="cursor-pointer hover:text-foreground">Update Address</li>
                <li className="cursor-pointer hover:text-foreground">Check Status</li>
                <li className="cursor-pointer hover:text-foreground">Schedule Test</li>
              </ul>
            </div>
            <div className="bg-secondary rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-sm mb-2">Office Hours</h3>
              <p className="text-xs text-muted-foreground">Mon-Fri: 8AM - 5PM</p>
              <p className="text-xs text-muted-foreground">Sat: 9AM - 1PM</p>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 max-w-2xl">
          {/* Step indicator */}
          <div className={`mb-6 ${isCalm ? 'navai-distraction' : ''}`}>
            <div className="flex items-center gap-2 text-sm">
              <span className={formStep >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}>1. Personal Info</span>
              <span className="text-muted-foreground">&rarr;</span>
              <span className={formStep >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}>2. Address</span>
              <span className="text-muted-foreground">&rarr;</span>
              <span className={formStep >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}>3. Documents</span>
            </div>
          </div>

          {/* Start button (before application started) */}
          {!started && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Driver License Application</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Apply for a new driver's license or permit. You'll need your personal information and a valid ID.
              </p>
              <Button
                data-navai="start-application"
                className="btn-pill-primary"
                onClick={() => {
                  setStarted(true);
                  onAction('[data-navai="start-application"]', true);
                }}
              >
                Start Application
              </Button>
            </div>
          )}

          {/* Step 1: Personal Info */}
          {started && formStep === 1 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-name">First Name *</Label>
                    <Input
                      id="first-name"
                      data-navai="first-name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('first-name', e.target.value)}
                      className={isTarget('first-name') ? 'ring-2 ring-primary' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Last Name *</Label>
                    <Input
                      id="last-name"
                      data-navai="last-name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('last-name', e.target.value)}
                      className={isTarget('last-name') ? 'ring-2 ring-primary' : ''}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      data-navai="dob"
                      value={formData.dob}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      className={isTarget('dob') ? 'ring-2 ring-primary' : ''}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    data-navai="continue-step-1"
                    className="btn-pill-primary"
                    onClick={() => {
                      setFormStep(2);
                      onAction('[data-navai="continue-step-1"]', true);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {started && formStep === 2 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Address Information</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    data-navai="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={isTarget('address') ? 'ring-2 ring-primary' : ''}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      data-navai="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={isTarget('city') ? 'ring-2 ring-primary' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(v) => {
                        setFormData(prev => ({ ...prev, state: v }));
                        onAction('[data-navai="state"]', true);
                      }}
                    >
                      <SelectTrigger
                        id="state"
                        data-navai="state"
                        className={isTarget('state') ? 'ring-2 ring-primary' : ''}
                      >
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setFormStep(1)}
                    className={isCalm ? 'navai-distraction' : ''}
                  >
                    Back
                  </Button>
                  <Button
                    data-navai="continue-step-2"
                    className="btn-pill-primary"
                    onClick={() => {
                      setFormStep(3);
                      onAction('[data-navai="continue-step-2"]', true);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {started && formStep === 3 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Upload Documents</h2>

              <div className="space-y-6">
                <div>
                  <Label>Proof of Identity *</Label>
                  <div
                    data-navai="upload-id"
                    className={`mt-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-secondary/50 transition-colors ${
                      isTarget('upload-id') ? 'border-primary bg-primary/5' : 'border-border'
                    } ${formData.uploadedFile ? 'bg-primary/10' : ''}`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, uploadedFile: true }));
                      onAction('[data-navai="upload-id"]', true);
                    }}
                  >
                    {formData.uploadedFile ? (
                      <p className="text-primary font-medium">&#10003; File uploaded: passport.pdf</p>
                    ) : (
                      <>
                        <p className="text-muted-foreground mb-2">Click to upload your ID document</p>
                        <p className="text-xs text-muted-foreground">Passport, Birth Certificate, or State ID</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="confirm"
                    data-navai="confirm-checkbox"
                    checked={formData.confirmed}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({ ...prev, confirmed: !!checked }));
                      onAction('[data-navai="confirm-checkbox"]', true);
                    }}
                    className={isTarget('confirm-checkbox') ? 'ring-2 ring-primary ring-offset-2' : ''}
                  />
                  <Label htmlFor="confirm" className="text-sm leading-relaxed cursor-pointer">
                    I confirm that all information provided is accurate and I understand that providing false information may result in denial of my application.
                  </Label>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setFormStep(2)}
                    className={isCalm ? 'navai-distraction' : ''}
                  >
                    Back
                  </Button>
                  <Button
                    data-navai="submit"
                    className="btn-pill-primary"
                    disabled={!formData.uploadedFile || !formData.confirmed}
                    onClick={() => {
                      onAction('[data-navai="submit"]', true);
                    }}
                  >
                    Submit Application
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Distracting notices */}
          {!isFocusAssist && (
            <div className={`mt-6 space-y-4 ${isCalm ? 'navai-distraction' : ''}`}>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-sm mb-1">Important Notice</h4>
                <p className="text-xs text-muted-foreground">
                  Processing times may vary. Most applications are processed within 2-4 weeks.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-sm mb-1">Need Help?</h4>
                <p className="text-xs text-muted-foreground">
                  Contact our support line at 1-800-555-0123 or visit your local DMV office.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
