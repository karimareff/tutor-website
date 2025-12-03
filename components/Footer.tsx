import Link from "next/link";
import { GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/50 mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span>TutorHub Egypt</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connect with Egypt's best tutors for ACT, SAT, and EST exam preparation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Students</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tutors" className="hover:text-primary transition-colors">Find Tutors</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Tutors</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/become-tutor" className="hover:text-primary transition-colors">Become a Tutor</Link></li>
              <li><Link href="/tutor-resources" className="hover:text-primary transition-colors">Resources</Link></li>
              <li><Link href="/tutor-support" className="hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TutorHub Egypt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
