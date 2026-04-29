import { useSocketBootstrap } from "../hooks/useSocket";
import { GridBoard } from "../components/Grid/GridBoard";
import { StatsBar } from "../components/Stats/StatsBar";
import { Leaderboard } from "../components/Leaderboard/Leaderboard";
import { ActivityFeed } from "../components/Activity/ActivityFeed";
import { UsernameModal } from "../components/User/UsernameModal";
import { AppHeader } from "../components/Header/AppHeader";

const Index = () => {
  useSocketBootstrap();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="order-2 lg:order-1">
            <GridBoard />
          </div>

          <aside className="order-1 flex flex-col gap-4 lg:order-2">
            <StatsBar />
            <Leaderboard />
            <ActivityFeed />
          </aside>
        </div>

     
      </main>

      <UsernameModal />
    </div>
  );
};

export default Index;
