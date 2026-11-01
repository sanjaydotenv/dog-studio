import { Canvas } from "@react-three/fiber";
import Dog from "./components/Dog";

const App = () => {
  return (
    <main className="bg-black w-full relative">
      {/* Fixed 3D Canvas */}
      <div className="fixed inset-0 pointer-events-none">
        <Canvas>
          <Dog />
        </Canvas>
      </div>

      {/* Scrollable Sections */}
      <section className="h-screen w-full border border-white relative z-0"></section>

      <section className="h-screen w-full border border-white relative z-0"></section>

      <section className="h-screen w-full border border-white relative z-0"></section>
    </main>
  );
};

export default App;
