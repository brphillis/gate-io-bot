// import NewListings from "@/components/NewListings";
import ControlPanel from "@/components/ControlPanel";

export const Home = async () => {
  return (
    <div className="flex flex-row items-center justify-center gap-12 h-[calc(100vh-56px)]">
      {/* <NewListings /> */}
      <ControlPanel />
    </div>
  );
};

export default Home;
