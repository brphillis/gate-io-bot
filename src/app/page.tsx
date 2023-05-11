import NewListings from "@/components/NewListings";
import PriceWatcher from "@/components/PriceWatcher";

export const Home = async () => {
  return (
    <div className="flex flex-row items-center justify-center gap-12 h-[calc(100vh-56px)]">
      <NewListings />
      <PriceWatcher />
    </div>
  );
};

export default Home;
