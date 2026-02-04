import { Link } from "wouter";
import { GraduationCap, Instagram, Youtube, Facebook } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Admissions", href: "/admissions" },
  ];

  const classLinks = [
    { name: "Class 9", href: "/class/class-9" },
    { name: "Class 10", href: "/class/class-10" },
    { name: "Class 11", href: "/class/class-11" },
    { name: "Class 12", href: "/class/class-12" },
  ];

  return (
    <footer className="bg-navy text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-skyblue" />
              <h3 className="text-xl font-bold">Pooja Academy</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Nurturing academic excellence for Classes 9-12 in Science and Commerce streams.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-skyblue transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-skyblue transition-colors"
                data-testid="link-youtube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-skyblue transition-colors"
                data-testid="link-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-skyblue transition-colors"
                    data-testid={`footer-link-${link.name.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Classes */}
          <div>
            <h4 className="font-semibold mb-4">Classes</h4>
            <ul className="space-y-2 text-sm">
              {classLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-skyblue transition-colors"
                    data-testid={`footer-link-${link.name.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p className="flex items-start">
                <span className="mr-2">📍</span>
                Kirari, Delhi - Near Haridas Vatika
              </p>
              <p className="flex items-center">
                <span className="mr-2">📞</span>
                +91 7011505239 (Ram Sir)
              </p>
              <a 
                href="https://wa.me/918800345115?text=Hello!%20I%20found%20Pooja%20Academy%20online%20and%20want%20to%20know%20more%20about%20your%20courses.%20Please%20share%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-skyblue transition-colors"
              >
                <span className="mr-2">💬</span>
                +91 8800345115 (WhatsApp)
              </a>
              <p className="flex items-center">
                <span className="mr-2">✉️</span>
                info@poojaacademy.com
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            &copy; 2025 Pooja Academy. All rights reserved. |{" "}
            <Link href="#" className="hover:text-skyblue transition-colors">
              Privacy Policy
            </Link>{" "}
            |{" "}
            <Link href="#" className="hover:text-skyblue transition-colors">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
