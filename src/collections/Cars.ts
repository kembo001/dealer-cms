import { CollectionConfig } from 'payload/types'

export const Car: CollectionConfig = {
  slug: 'cars',
  admin: {
    useAsTitle: 'model',
  },
  fields: [
    {
      name: 'make',
      type: 'text',
      required: true,
    },
    {
      name: 'model',
      type: 'text',
      required: true,
    },
    {
      name: 'year',
      type: 'number',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'mileage',
      type: 'number',
    },
    {
      name: 'transmission',
      type: 'select',
      options: ['Automatic', 'Manual'],
    },
    {
      name: 'fuelType',
      type: 'select',
      options: ['Gasoline', 'Diesel', 'Electric', 'Hybrid'],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'feature',
          type: 'text',
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
