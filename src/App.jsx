import AppRoutes from "./routes/AppRoutes";

function App() {

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex flex-col">
      <main className="flex-grow">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;