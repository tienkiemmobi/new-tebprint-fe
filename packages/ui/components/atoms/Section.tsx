export const Section = (props: any) => (
  <div className={props.className || `mx-auto max-w-screen-lg px-3 py-6`}>
    {props.title && <div className="mb-6 text-2xl font-bold"></div>}
    {props.children}
  </div>
);
