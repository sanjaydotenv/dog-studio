import { Canvas } from "@react-three/fiber";
import Dog from "./components/Dog";


const App = () => {
  return (
    <main className="bg-black w-full relative">
      {/* Fixed 3D Canvas */}
      <div className="fixed inset-0 pointer-events-none bg-[url(/background-m.png)] bg-cover">
        <Canvas>
          <Dog />
        </Canvas>
      </div>

      {/* Scrollable Sections */}
      <section
        id="section-1"
        className="h-screen w-full border border-white relative z-0"
      ></section>

      <section
        id="section-2"
        className="h-screen w-full border border-white relative z-0"
      ></section>

      <section
        id="section-3"
        className="h-screen w-full border border-white relative z-0"
      ></section>
    </main>
  );
};

export default App;
