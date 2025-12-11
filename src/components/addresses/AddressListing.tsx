'use client'

import { AddressItem } from '@/components/addresses/AddressItem'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { MapPin } from 'lucide-react'
import React from 'react'

export const AddressListing: React.FC = () => {
  const { addresses } = useAddresses()

  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-background rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-medium text-text-primary mb-2">
          No addresses yet
        </h2>
        <p className="text-gray-600">
          Add your first address to make checkout faster
        </p>
      </div>
    )
  }

  return (
    <div>
      <ul className="flex flex-col gap-6">
        {addresses.map((address) => (
          <li 
            key={address.id} 
            className="bg-primary-background border border-[#d1d5db] rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <AddressItem address={address} />
          </li>
        ))}
      </ul>
    </div>
  )
}
