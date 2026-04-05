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

type SidebarItemsOptions = {
  moduleEnabled?: Partial<Record<SidebarKey, boolean>>;
  canManageProject?: boolean;
};

export function sidebarItems(
  kind: ProjectKind,
  options: SidebarItemsOptions = {},
): {
  main: SidebarItemType[];
  secondary: SidebarItemType[];
} {
  const isEnabled = (key: SidebarKey, fallback = true) =>
    options.moduleEnabled?.[key] ?? fallback;

  const common: SidebarItemType[] = [
    { key: "dashboard", label: "Dashboard", iconBase: "grid", enabled: true },
  ];

  if (kind === "MARITIME") {
    return {
      main: [
        ...common,
        {
          key: "vessels",
          label: "Vessels",
          iconBase: "boat",
          enabled: isEnabled("vessels"),
        },
        {
          key: "certificates",
          label: "Certificates",
          iconBase: "document-text",
          enabled: isEnabled("certificates"),
        },
        {
          key: "crew",
          label: "Crew",
          iconBase: "people",
          enabled: isEnabled("crew"),
        },
        {
          key: "maintenance",
          label: "Maintenance",
          iconBase: "construct",
          enabled: isEnabled("maintenance"),
        },
        {
          key: "fuel",
          label: "Fuel",
          iconBase: "flame",
          enabled: isEnabled("fuel", false),
        },
      ],
      secondary: [
        {
          key: "settings",
          label: "Settings",
          iconBase: "settings",
          enabled: options.canManageProject ?? false,
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
          enabled: options.canManageProject ?? false,
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
          enabled: options.canManageProject ?? false,
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
        enabled: options.canManageProject ?? false,
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
