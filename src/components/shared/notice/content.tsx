export default function Content() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center ">
      <div className="bg-white rounded shadow-md p-6 w-full px-4">
          <p className="text-xl text-gray-500 font-medium">Price adjustment</p>
          <ul className="text-xl text-gray-500 font-medium ps-3 list-disc ms-4">
            <li>Starting from March 3, 2025, the fees for blank cards will be adjusted as follows:</li>
            <li>Blank card: 12,000 per card</li>
            <li>eSIM cancellation fee and top up sim card cancellation fee remain the same.</li>
            <li>eSIM cancellation fee: 12,000 per card; for automatic returns of already redeemed eSIMs, the original handling fee of 12,000 will be adjusted to 10,000 </li>
          </ul>
      </div>
    </div>
  );
}