function ProgressBar({ current, total }) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
      <div className="text-sm text-gray-600 mt-1">
        {current} of {total} completed ({percentage}%)
      </div>
    </div>
  );
}

export default ProgressBar;
