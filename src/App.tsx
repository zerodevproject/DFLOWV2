import { useConvexAuth } from "convex/react";
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginView } from '@/views/LoginView';
import { DataSyncProvider } from '@/components/layout/DataSyncProvider';

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <p className="label-micro animate-pulse lowercase tracking-[0.2em] text-muted-foreground/50">Inicializando Sistema...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <DataSyncProvider>
      <AppLayout />
    </DataSyncProvider>
  );
}

export default App;
