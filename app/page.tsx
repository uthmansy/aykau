import LocationForm from "@/components/layout/LocationForm";
import { Button } from "antd";

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>My SaaS App</h1>
      <Button type="primary">Ant Design Ready</Button>
      <LocationForm />
    </div>
  );
}
