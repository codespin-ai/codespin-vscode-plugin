import { Bloom } from "bloom-router";
import "./pages/conversations/conversations-page.js";
import "./pages/initialize/initialize-page.js";

const bloom = new Bloom("app");

bloom.page("/start", async function* () {
  return <initialize-page />;
});

bloom.page("/conversations", async function* () {
  return <conversations-page />;
});

bloom.goto("/start");
