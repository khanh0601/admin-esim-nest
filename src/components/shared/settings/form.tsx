'use client'

import { useState } from 'react'

export default function FormSetting() {
  const [formData, setFormData] = useState({
    merchantId: 'b000052',
    deptId: '000068',
    token: '948b1e457ba7c66f6ccc47a880197308e',
    redeemCallbackUrl: 'https://worldesim.vn/wp-json/worldmove/v1/webhook/',
    esimOrderCallbackUrl: 'https://worldesim.vn/wp-json/worldmove/v1/callback-mybuyesim/',
    esimOrderRedeemCallbackUrl: '',
    topupCallbackUrl: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Gọi API cập nhật ở đây nếu cần
  }

  return (
    <div className=" bg-gray-100 ">
      <form
        onSubmit={handleSubmit}
        className="mx-auto bg-white p-6 rounded shadow space-y-6"
      >

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
          <Input label="MerchantId" name="merchantId" value={formData.merchantId} readOnly />
          <Input label="DeptId" name="deptId" value={formData.deptId} readOnly />
          <Input label="Token" name="token" value={formData.token} readOnly />
          <Input
            label="Redeem Redemption Code Callback URL"
            name="redeemCallbackUrl"
            value={formData.redeemCallbackUrl}
            onChange={handleChange}
          />
          <Input
            label="eSIM Order Callback URL"
            name="esimOrderCallbackUrl"
            value={formData.esimOrderCallbackUrl}
            onChange={handleChange}
          />
          <Input
            label="eSIM Order and Redeem Callback URL"
            name="esimOrderRedeemCallbackUrl"
            value={formData.esimOrderRedeemCallbackUrl}
            onChange={handleChange}
          />
          <Input
            label="Top-up Callback URL"
            name="topupCallbackUrl"
            value={formData.topupCallbackUrl}
            onChange={handleChange}
          />
        </div>

        <div className="text-left">
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded cursor-pointer"
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  )
}

function Input({
  label,
  name,
  value,
  onChange,
  readOnly = false,
}: {
  label: string
  name: string
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        className={`px-3 py-2 border rounded ${
          readOnly
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'focus:outline-none focus:ring-2 focus:ring-yellow-400'
        }`}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    </div>
  )
}
