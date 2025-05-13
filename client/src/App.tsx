import { Route, Switch } from "wouter";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "@/pages/not-found";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <TooltipProvider>
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
