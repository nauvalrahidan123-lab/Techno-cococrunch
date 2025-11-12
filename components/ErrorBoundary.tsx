import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State;

  // FIX: Initialize state within the constructor.
  // This is a more traditional approach that can prevent obscure TypeScript errors
  // related to class fields and inheritance, which likely caused the incorrect error
  // stating that 'this.props' does not exist.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Anda juga bisa mengirim log error ke layanan pelaporan error
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // UI fallback kustom
      const isFirebaseConfigError = this.state.error?.message.includes("Konfigurasi Firebase");

      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 p-4 font-sans">
            <div className="w-full max-w-2xl p-8 space-y-4 bg-white rounded-xl shadow-2xl border-2 border-red-200">
                <h1 className="text-2xl font-bold font-display text-center text-red-700">Terjadi Kesalahan Kritis</h1>
                <p className="text-gray-600 text-center">
                    Aplikasi gagal dimuat. Mohon maaf atas ketidaknyamanannya.
                </p>
                
                {isFirebaseConfigError ? (
                    <div className="bg-amber-50 p-4 mt-4 rounded-md border border-amber-200">
                         <h2 className="font-semibold text-amber-800">Masalah Konfigurasi Terdeteksi</h2>
                         <p className="text-sm text-amber-700 mt-2">
                            Aplikasi ini sepertinya belum terhubung dengan database. Jika Anda adalah pengembang, harap periksa <b>console browser</b> untuk melihat pesan error detail dan petunjuk cara memperbaiki konfigurasi Firebase.
                         </p>
                    </div>
                ) : (
                    <div className="bg-gray-100 p-4 mt-4 rounded-md overflow-x-auto">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Detail Error:</p>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            <code>
                                {this.state.error?.message || 'Error tidak diketahui'}
                            </code>
                        </pre>
                    </div>
                )}
                 <div className="text-center pt-4">
                     <button
                        onClick={() => window.location.reload()}
                        className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Coba Muat Ulang
                    </button>
                 </div>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
