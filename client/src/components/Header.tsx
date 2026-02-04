import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, Settings } from "lucide-react";
import poojaLogo from "@assets/image_1756024744044.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [location, setLocation] = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDashboardAccess = () => {
    const pass = window.prompt("Enter dashboard password");
    if (pass === "Rambhaiya@9958") {
      sessionStorage.setItem("adminAccess", "1");
      setLocation("/admin");
    } else if (pass !== null) {
      window.alert("Incorrect password");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const classLinks = [
    { name: "Class 9", href: "/class/class-9" },
    { name: "Class 10", href: "/class/class-10" },
    { name: "Class 11", href: "/class/class-11" },
    { name: "Class 12", href: "/class/class-12" },
  ];

  return (
    <header className="bg-slate-900 text-white fixed top-0 w-full z-50 shadow-xl transition-all duration-300">
      <nav className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5" data-testid="link-home">
            <img
              src={poojaLogo}
              alt="Pooja Academy"
              className="h-7 w-auto sm:h-9 object-contain invert transition-all duration-300 hover:scale-105"
            />
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent tracking-wide">Pooja Academy</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-skyblue transition-all duration-300 hover:scale-105 relative group ${location === link.href ? "text-skyblue" : ""
                  }`}
                data-testid={`link-${link.name.toLowerCase().replace(" ", "-")}`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-skyblue transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}

            {/* Classes Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="hover:text-skyblue transition-all duration-300 hover:scale-105 flex items-center relative group" data-testid="button-classes-dropdown">
                Classes <ChevronDown className="ml-1 h-4 w-4" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-skyblue transition-all duration-300 group-hover:w-full"></span>
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl animate-fade-in">
                  <div className="py-2">
                    {classLinks.map((classLink) => (
                      <Link
                        key={classLink.href}
                        href={classLink.href}
                        className="block px-4 py-2 text-navy hover:bg-skyblue transition-all duration-300 hover:pl-6"
                        data-testid={`link-${classLink.name.toLowerCase().replace(" ", "-")}`}
                      >
                        {classLink.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              className="bg-skyblue text-navy hover:bg-blue-200 font-medium flex items-center gap-2"
              data-testid="button-dashboard"
              onClick={handleDashboardAccess}
            >
              <Settings className="w-4 h-4" />
              Dashboard
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-navy text-white">
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-lg hover:text-skyblue transition-colors ${location === link.href ? "text-skyblue" : ""
                      }`}
                    data-testid={`mobile-link-${link.name.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="border-t border-gray-600 pt-4">
                  <div className="text-lg font-semibold mb-2">Classes</div>
                  {classLinks.map((classLink) => (
                    <Link
                      key={classLink.href}
                      href={classLink.href}
                      className="block text-gray-300 hover:text-skyblue transition-colors py-2"
                      data-testid={`mobile-link-${classLink.name.toLowerCase().replace(" ", "-")}`}
                    >
                      {classLink.name}
                    </Link>
                  ))}
                </div>

                <Button
                  className="bg-skyblue text-navy hover:bg-blue-200 font-medium mt-4 flex items-center gap-2 w-full"
                  data-testid="mobile-button-dashboard"
                  onClick={handleDashboardAccess}
                >
                  <Settings className="w-4 h-4" />
                  Dashboard
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Header;
