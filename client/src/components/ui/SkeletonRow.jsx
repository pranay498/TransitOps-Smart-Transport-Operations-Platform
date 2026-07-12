const SkeletonRow = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 rounded skeleton" style={{ width: i === 0 ? '60%' : '40%' }} />
      </td>
    ))}
  </tr>
);

export const SkeletonTable = ({ cols = 6, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} cols={cols} />
    ))}
  </>
);

export default SkeletonRow;
