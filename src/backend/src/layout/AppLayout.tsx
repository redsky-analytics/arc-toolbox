import type { ReactNode } from "react";
import { Layout as RALayout, CheckForApplicationUpdate } from "react-admin";
import { AppMenu } from "./AppMenu";

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <RALayout menu={AppMenu}>
    {children}
    <CheckForApplicationUpdate />
  </RALayout>
);
