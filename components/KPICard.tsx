interface Props {
  title: string;
  value: string;
  growth?: string;
}

export default function KPICard({ title, value, growth }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h4 className="text-gray-500 text-sm">{title}</h4>
      <div className="flex justify-between items-center mt-2">
        <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
        {growth && (
          <span className="text-green-500 text-sm">{growth}</span>
        )}
      </div>
    </div>
  );
}