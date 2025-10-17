"use client";

export interface ViewWrapperProps {
  name: string;
  active: boolean;
  children: React.ReactNode;
}

type ViewProps<V extends string> = {
  name: V;
  isActive: (name: V) => boolean;
  children: React.ReactNode;
  Wrapper?: React.ComponentType<ViewWrapperProps>;
  keepMounted?: boolean;
};

export function View<V extends string>({
  name,
  isActive,
  children,
  Wrapper,
  keepMounted = false,
}: ViewProps<V>) {
  const active = isActive(name);

  if (!active && !keepMounted) return null;

  const content = Wrapper ? (
    <Wrapper name={name} active={active}>
      {children}
    </Wrapper>
  ) : active ? (
    <>{children}</>
  ) : null;

  return content;
}
