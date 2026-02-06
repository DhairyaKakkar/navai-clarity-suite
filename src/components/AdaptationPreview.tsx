import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function AdaptationPreview() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-display-sm md:text-display-md font-semibold tracking-tight text-center mb-6">
            If you seem stuck, NavAI gets calmer.
          </h2>
          
          <p className="text-muted-foreground text-center text-lg max-w-prose-wide mx-auto mb-12 leading-relaxed">
            NavAI detects when you might be struggling — based only on your interactions like 
            hesitation or misclicks — and automatically adapts the interface to reduce 
            distractions. You're always in control and can opt out anytime.
          </p>

          {/* Preview of toggles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-navai-surface rounded-xl p-6 md:p-8"
          >
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Sample controls available in the demo:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <Label htmlFor="preview-calm" className="text-sm cursor-pointer">
                  Calm Mode
                </Label>
                <Switch id="preview-calm" disabled checked />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <Label htmlFor="preview-motion" className="text-sm cursor-pointer">
                  Reduce Motion
                </Label>
                <Switch id="preview-motion" disabled />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <Label htmlFor="preview-text" className="text-sm cursor-pointer">
                  Larger Text
                </Label>
                <Switch id="preview-text" disabled />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <Label htmlFor="preview-contrast" className="text-sm cursor-pointer">
                  High Contrast
                </Label>
                <Switch id="preview-contrast" disabled />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
