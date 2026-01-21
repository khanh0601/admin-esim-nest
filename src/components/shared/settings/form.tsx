'use client'

import { useState, useEffect } from 'react'
import { userApi } from '@/lib/api'
import type { ApiError } from '@/lib/api/types'

export default function FormSetting() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    esimOrderCallbackUrl: '',
    topupCallbackUrl: '',
    redeemCallbackUrl: '',
  })
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await userApi.getProfile()
        
        if (response.data) {
          setToken(response.data.token || '')
          setFormData({
            email: response.data.email || '',
            firstName: response.data.first_name || '',
            lastName: response.data.last_name || '',
            esimOrderCallbackUrl: response.data.order_call_back_url || '',
            topupCallbackUrl: response.data.top_up_call_back_url || '',
            redeemCallbackUrl: response.data.redeem_call_back_url || '',
          })
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        const apiError = err as ApiError
        setError(apiError.message || 'Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear messages when user starts typing
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Note: email is not included because it's readonly and cannot be updated
      const updateData = {
        order_call_back_url: formData.esimOrderCallbackUrl || undefined,
        top_up_call_back_url: formData.topupCallbackUrl || undefined,
        redeem_call_back_url: formData.redeemCallbackUrl || undefined,
        first_name: formData.firstName || undefined,
        last_name: formData.lastName || undefined,
      }

      const response = await userApi.updateProfile(updateData)
      
      setSuccess(response.message || 'Settings updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to update profile:', err)
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to update settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-teal-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-3 text-gray-600">Loading profile data...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md border border-gray-200 p-8 space-y-8"
      >
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Email - Readonly */}
          <Input
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            readOnly
          />

          {/* Token - Readonly */}
          <Input
            label="Token"
            name="token"
            value={token}
            onChange={() => {}} // No-op since it's readonly
            placeholder="Token"
            readOnly
          />

          {/* First Name and Last Name - Editable */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </div>

          {/* Callback URLs */}
          <Input
            label="eSIM Order Callback URL"
            name="esimOrderCallbackUrl"
            value={formData.esimOrderCallbackUrl}
            onChange={handleChange}
            placeholder="Enter eSIM order callback URL"
          />
          <Input
            label="Qrcode eSIM Callback"
            name="redeemCallbackUrl"
            value={formData.redeemCallbackUrl}
            onChange={handleChange}
            placeholder="Enter redeem callback URL"
          />
          <Input
            label="Top-up Callback URL"
            name="topupCallbackUrl"
            value={formData.topupCallbackUrl}
            onChange={handleChange}
            placeholder="Enter top-up callback URL"
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              'Apply Changes'
            )}
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
  placeholder,
  readOnly = false,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        className={`px-4 py-2.5 border rounded-lg transition-all placeholder-gray-400 ${
          readOnly
            ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed'
            : 'bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400'
        }`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  )
}
