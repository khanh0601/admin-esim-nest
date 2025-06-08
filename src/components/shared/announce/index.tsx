'use client'
import React, {useState} from "react";
import Breadcrumb from "../global/Breakcrum";
import NoticeList from "./NoticeList";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
export default function Announce() {
  const allNotices = [
    {
      date: "2025/05/20 10:21:21",
      title: "about SSL certificate",
      description: `Please note that test environment does not install an SSL certificate, so please fully trust or ignore the certificate for the test environment.\nThanks.\nSince the test environment does not have an SSL certificate installed, please fully trust or ignore the certificate in the test environment. Thank you.`,
      pinned: true,
    },
    {
      date: "2025/05/20 10:27:31",
      title: "API document v1.9.0",
      description: `Starting from API document version 1.9.0, you can use \`wmproductId\` instead of combining \`productId\` and \`productName\` in the product list of:

- 2.1 eSIM Order
- 2.4 eSIM Order and Redeem

This adjustment helps simplify the structure and improves consistency across API requests. Please update your implementation accordingly.`,
    },
    {
      date: "2025/05/20 10:29:21",
      title: "about SSL certificate",
      description: `Please note that test environment does not install an SSL certificate, so please fully trust or ignore the certificate for the test environment.\nThanks.\nSince the test environment does not have an SSL certificate installed, please fully trust or ignore the certificate in the test environment. Thank you.`,
    },
    {
      date: "2025/05/20 10:31:41",
      title: "about SSL certificate",
      description: `Please note that test environment does not install an SSL certificate, so please fully trust or ignore the certificate for the test environment.\nThanks.\nSince the test environment does not have an SSL certificate installed, please fully trust or ignore the certificate in the test environment. Thank you.`,
    },
    {
      date: "2025/05/20 10:38:51",
      title: "API document v1.9.1",
      description: `Starting from API document version 1.9.0, you can use \`wmproductId\` instead of combining \`productId\` and \`productName\` in the product list of:

- 2.1 eSIM Order
- 2.4 eSIM Order and Redeem

This adjustment helps simplify the structure and improves consistency across API requests. Please update your implementation accordingly.`,
    },
    {
      date: "2025/05/20 10:44:31",
      title: "API document v1.9.0",
      description: `Starting from API document version 1.9.0, you can use \`wmproductId\` instead of combining \`productId\` and \`productName\` in the product list of:

- 2.1 eSIM Order
- 2.4 eSIM Order and Redeem

This adjustment helps simplify the structure and improves consistency across API requests. Please update your implementation accordingly.`,
    },
    {
      date: "2025/05/20 10:51:31",
      title: "API document v1.9.0",
      description: `Starting from API document version 1.9.0, you can use \`wmproductId\` instead of combining \`productId\` and \`productName\` in the product list of:

- 2.1 eSIM Order
- 2.4 eSIM Order and Redeem

This adjustment helps simplify the structure and improves consistency across API requests. Please update your implementation accordingly.`,
    },
  ];
  
  const PAGE_SIZE = 4;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = allNotices.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
      <div>
          <Breadcrumb title="Daily Notice" path={[
              { label: "Home", href: "/" },
              { label: "Daily Notice"}
          ]} />
          <div className="bg-white p-6 rounded shadow">
            <SearchBar onSearch={setSearchTerm} onReset={() => setSearchTerm("")} />
            <NoticeList data={paginated} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
      </div>
  );
}