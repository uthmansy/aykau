import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

export const getStatusConfig = (status: string) => {
  switch (status) {
    case "pending":
      return {
        color: "blue",
        icon: <ClockCircleOutlined />,
        label: "Pending Review",
      };
    case "responded":
      return {
        color: "orange",
        icon: <MessageOutlined />,
        label: "Client Responded",
      };
    case "accepted":
      return {
        color: "green",
        icon: <CheckCircleOutlined />,
        label: "Accepted",
      };
    case "declined":
      return {
        color: "red",
        icon: <CloseCircleOutlined />,
        label: "Declined",
      };
    case "withdrawn":
      return {
        color: "default",
        icon: <CloseCircleOutlined />,
        label: "Withdrawn",
      };
    default:
      return { color: "default", icon: null, label: status };
  }
};
