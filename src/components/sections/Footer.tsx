// "use client";

// import { Button } from "../ui/Button";

// export function Footer() {
//   const scrollToSection = (sectionId: string) => {
//     document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
//   };

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   return (
//     <footer className="bg-gray-900 text-white">
//       <div className="container mx-auto px-4 py-12">
//         <div className="grid md:grid-cols-4 gap-8">
//           {/* Brand */}
//           <div className="md:col-span-2">
//             <div className="flex items-center space-x-2 mb-4">
//               <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
//               <span className="text-xl font-bold">CoachPro</span>
//             </div>
//             <p className="text-gray-400 mb-4 max-w-md">
//               Професійне тренування для футболістів 16-35 років. Індивідуальний
//               підхід, сучасні методики, доведені результати.
//             </p>
//             <Button
//               onClick={scrollToTop}
//               variant="outline"
//               className="border-gray-600 text-white hover:bg-gray-800"
//             >
//               Нагору ↑
//             </Button>
//             <button
//               onClick={() => window.open("/admin", "_blank")}
//               className="block text-gray-400 hover:text-white transition-colors text-left"
//             >
//               Адмін-панель
//             </button>
//             <button
//               onClick={() => window.open("/analytics", "_blank")}
//               className="block text-gray-400 hover:text-white transition-colors text-left"
//             >
//               Аналітика
//             </button>
//           </div>

//           {/* Navigation */}
//           <div>
//             <h3 className="font-semibold text-lg mb-4">Навігація</h3>
//             <nav className="space-y-2">
//               {[
//                 { name: "Головна", id: "hero" },
//                 { name: "Курси", id: "courses" },
//                 { name: "Контакти", id: "contact" },
//               ].map((item) => (
//                 <button
//                   key={item.id}
//                   onClick={() => scrollToSection(item.id)}
//                   className="block text-gray-400 hover:text-white transition-colors text-left"
//                 >
//                   {item.name}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           {/* Contact Info */}
//           <div>
//             <h3 className="font-semibold text-lg mb-4">Контакти</h3>
//             <div className="space-y-2 text-gray-400">
//               <p>📧 coachpro@example.com</p>
//               <p>📞 +380 (99) 123-45-67</p>
//               <p>🕒 Пн-Пт: 9:00 - 18:00</p>
//               <div className="flex space-x-4 mt-4">
//                 {["Facebook", "Instagram", "Telegram"].map((social) => (
//                   <button
//                     key={social}
//                     className="text-gray-400 hover:text-white transition-colors"
//                   >
//                     {social}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom */}
//         <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
//           <p>&copy; 2024 CoachPro. Всі права захищені.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }

'use client'

import { Button } from '../../components/ui/Button'

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
              <span className="text-xl font-bold">CoachPro</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Професійне тренування для футболістів 16-35 років. 
              Індивідуальний підхід, сучасні методики, доведені результати.
            </p>
            <Button 
              onClick={scrollToTop}
              variant="outline" 
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Нагору ↑
            </Button>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Навігація</h3>
            <nav className="space-y-2">
              {[
                { name: 'Головна', id: 'hero' },
                { name: 'Курси', id: 'courses' },
                { name: 'Контакти', id: 'contact' },
                { name: 'Адмін-панель', url: '/admin' },
                { name: 'Аналітика', url: '/analytics' },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => item.url ? window.open(item.url, '_blank') : scrollToSection(item.id!)}
                  className="block text-gray-400 hover:text-white transition-colors text-left"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Contact Info & Payment Methods */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Контакти та оплата</h3>
            <div className="space-y-3 text-gray-400">
              <div>
                <p className="font-medium text-white mb-2">Контакти:</p>
                <p>📧 coachpro@example.com</p>
                <p>📞 +380 (99) 123-45-67</p>
                <p>🕒 Пн-Пт: 9:00 - 18:00</p>
              </div>
              
              <div className="pt-4">
                <p className="font-medium text-white mb-2">Способи оплати:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Visa', icon: '💳' },
                    { name: 'Mastercard', icon: '💳' },
                    { name: 'Apple Pay', icon: '📱' },
                    { name: 'Google Pay', icon: '📱' },
                    { name: 'Privat24', icon: '🏦' },
                    { name: 'Monobank', icon: '🏦' },
                  ].map((method) => (
                    <div key={method.name} className="flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded text-sm">
                      <span>{method.icon}</span>
                      <span>{method.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs text-gray-500">
                  💳 Безпечна оплата через Stripe
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 CoachPro. Всі права захищені.</p>
          <p className="text-sm mt-1">Безпечні платежі з Stripe</p>
        </div>
      </div>
    </footer>
  )
}