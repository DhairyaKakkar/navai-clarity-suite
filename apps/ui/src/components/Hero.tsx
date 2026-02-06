import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center justify-center pt-20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-display-md md:text-display-lg lg:text-display-xl font-semibold tracking-tight mb-6">
            No overwhelm.
            <br />
            <span className="text-muted-foreground">Just the next step.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-prose-narrow mx-auto mb-8 leading-relaxed">
            Type a goal. NavAI highlights what to do — one step at a time — across websites.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to="/demo"
              className="btn-pill-primary text-base px-8 py-4"
            >
              Try Demo
            </Link>
            <a
              href="#"
              className="btn-pill-secondary text-base px-8 py-4"
              onClick={(e) => {
                e.preventDefault();
                alert('Extension coming soon!');
              }}
            >
              Install Extension
            </a>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Built for calm, clarity, and control.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
