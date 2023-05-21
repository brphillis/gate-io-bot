// import NewListings from "@/components/NewListings";
import ControlPanel from "@/components/ControlPanel";

export const Home = async () => {
  return (
    <div className="h-max min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-gray-600 bg-gradient-to-r">
      <ControlPanel />
    </div>
  );
};

export default Home;
