// sidebarItems.ts
import { ProjectKind } from "@/src/contracts/projects.contract";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { SidebarKey } from "./sidebarKey";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export type SidebarItemType = {
  key: SidebarKey;
  label: string;
  iconBase: IconName;
  enabled?: boolean;
};

export function sidebarItems(kind: ProjectKind): {
  main: SidebarItemType[];
  secondary: SidebarItemType[];
} {
  const common: SidebarItemType[] = [
    { key: "dashboard", label: "Dashboard", iconBase: "grid", enabled: true },
  ];

  if (kind === "MARITIME") {
    return {
      main: [
        ...common,
        { key: "vessels", label: "Vessels", iconBase: "boat", enabled: true },
        {
          key: "certificates",
          label: "Certificates",
          iconBase: "document-text",
          enabled: true,
        },
        { key: "crew", label: "Crew", iconBase: "people", enabled: true },
        {
          key: "maintenance",
          label: "Maintenance",
          iconBase: "construct",
          enabled: true,
        },
        {
          key: "fuel",
          label: "Fuel",
          iconBase: "flame",
          enabled: true,
        },
      ],
      secondary: [
        {
          key: "settings",
          label: "Settings",
          iconBase: "settings",
          enabled: false,
        },
        {
          key: "help",
          label: "Help & Support",
          iconBase: "help-circle",
          enabled: false,
        },
      ],
    };
  }

  if (kind === "STORE") {
    return {
      main: [
        ...common,
        {
          key: "products",
          label: "Products",
          iconBase: "bag-handle",
          enabled: false,
        },
        { key: "orders", label: "Orders", iconBase: "receipt", enabled: false },
      ],
      secondary: [
        {
          key: "settings",
          label: "Settings",
          iconBase: "settings",
          enabled: false,
        },
        {
          key: "help",
          label: "Help & Support",
          iconBase: "help-circle",
          enabled: false,
        },
      ],
    };
  }

  if (kind === "BARBERSHOP") {
    return {
      main: [
        ...common,
        {
          key: "appointments",
          label: "Appointments",
          iconBase: "calendar",
          enabled: false,
        },
        { key: "staff", label: "Staff", iconBase: "people", enabled: false },
      ],
      secondary: [
        {
          key: "settings",
          label: "Settings",
          iconBase: "settings",
          enabled: false,
        },
        {
          key: "help",
          label: "Help & Support",
          iconBase: "help-circle",
          enabled: false,
        },
      ],
    };
  }

  return {
    main: common,
    secondary: [
      {
        key: "settings",
        label: "Settings",
        iconBase: "settings",
        enabled: false,
      },
      {
        key: "help",
        label: "Help & Support",
        iconBase: "help-circle",
        enabled: false,
      },
    ],
  };
}
