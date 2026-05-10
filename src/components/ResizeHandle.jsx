export default function ResizeHandle({ axis = "x", onMouseDown, onReset }) {
  const isX = axis === "x";
  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={onReset}
      style={{ [isX ? "width" : "height"]: "5px", flexShrink: 0 }}
      className={[
        "relative z-10 group flex items-center justify-center",
        isX ? "cursor-col-resize h-full" : "cursor-row-resize w-full",
      ].join(" ")}
    >
      {/* Divider line */}
      <div
        className="bg-[#30363d] group-hover:bg-[#58a6ff] transition-colors duration-150"
        style={{
          [isX ? "width" : "height"]: "1px",
          [isX ? "height" : "width"]: "100%",
        }}
      />
      {/* Grip dots */}
      <div className="absolute flex opacity-0 group-hover:opacity-100 transition-opacity duration-150 gap-[3px]"
        style={{ flexDirection: isX ? "column" : "row" }}
      >
        {[0,1,2].map(i => (
          <div key={i} className="w-[3px] h-[3px] rounded-full bg-[#58a6ff]" />
        ))}
      </div>
    </div>
  );
}