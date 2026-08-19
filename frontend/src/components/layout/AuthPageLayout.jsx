export default function AuthLayout({ children }) {
  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6" 
      style={{ backgroundImage: "url('/images/background1.jpg')" }}
    >
      {/* Dark overlay for contrast and readability */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[3px]"></div>
      
      {/* Centered content box */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}