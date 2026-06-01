"use client";

import { Form, Button, Typography, message } from "antd";
import MapPinSelector from "../ui/MapPinSelector";

export default function LocationForm() {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log("Form submitted:", values);
    message.success(
      `Location selected: ${values.location.lat.toFixed(
        4
      )}, ${values.location.lng.toFixed(4)}`
    );
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <Typography.Title level={4}>Select Location</Typography.Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ location: { lat: 11.67388889, lng: 9.14111111 } }}
      >
        <Form.Item
          name="location"
          label="Pin Location"
          rules={[
            {
              required: true,
              message: "Please click or drag the pin to select a location",
            },
          ]}
          // Ant Design expects `value` and `onChange` by default.
          // No extra props needed here.
        >
          <MapPinSelector height="350px" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save Location
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
