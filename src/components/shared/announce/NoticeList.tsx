interface Notice {
  date: string;
  title: string;
  description: string;
  pinned?: boolean;
}

interface Props {
  data: Notice[];
}

export default function NoticeList({ data }: Props) {
  return (
    <table className="w-full border border-gray-300 text-lg">
      <thead>
        <tr className="bg-gradient-to-r from-[#E592FB] to-[#5E31F9] text-left">
          <th className="p-2 border w-1/5 border-gray-300">Publication date</th>
          <th className="p-2 border w-1/5 border-gray-300">Update Product</th>
          <th className="p-2 border w-3/5 border-gray-300">Description</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className="border-t border-gray-300">
            <td className="p-4 align-top text-gray-700">
              {item.pinned && <span className="text-red-500 mr-1">📌</span>}
              {item.date}
            </td>
            <td className="p-4 align-top text-gray-800 font-medium">{item.title}</td>
            <td className="p-4 text-gray-600 whitespace-pre-line">{item.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}