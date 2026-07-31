export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-1">   
      {children}
      <div className="relative hidden flex-1 flex-col justify-center lg:flex">
        
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('/images/background1.jpg')" 
          }}
        >
          <div className="absolute inset-0 bg-indigo-900 opacity-60"></div>
        </div>
        
        <div className="relative mx-auto max-w-md text-center text-white">
          <h1 className="text-3xl font-semibold tracking-tight">
            KSOP-K Si-Cekatan
          </h1>
          <p className="mt-4 text-lg text-indigo-100">
            Sistem Clearance kapal Tradisional
          </p>
        </div>

      </div>
    </div>
  );
}