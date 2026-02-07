require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../src/models/Service');

const services = [
  { name: 'House Cleaning', genderTag: 'B' },
  { name: 'Deep Cleaning', genderTag: 'B' },
  { name: 'Move-In/Move-Out Cleaning', genderTag: 'B' },
  { name: 'Laundry & Ironing', genderTag: 'W' },
  { name: 'Yard Cleaning', genderTag: 'M' },
  { name: 'Garden Maintenance', genderTag: 'M' },
  { name: 'Window Cleaning', genderTag: 'B' },
  { name: 'Pool Cleaning', genderTag: 'M' },
  { name: 'Rubbish Removal', genderTag: 'B' },
  { name: 'Home Organization', genderTag: 'B' },
  { name: 'Babysitting', genderTag: 'W' },
  { name: 'Nanny – Stay In', genderTag: 'W' },
  { name: 'Nanny – Stay Out', genderTag: 'W' },
  { name: 'Elderly Caregiver – Home Visits', genderTag: 'B' },
  { name: 'Elderly Caregiver – Live In', genderTag: 'B' },
  { name: 'Disability Care Assistant', genderTag: 'B' },
  { name: 'General Handyman', genderTag: 'B' },
  { name: 'Minor Electrical Repairs', genderTag: 'B' },
  { name: 'Minor Plumbing Repairs', genderTag: 'B' },
  { name: 'Painting (Small Jobs)', genderTag: 'M' },
  { name: 'Furniture Assembly', genderTag: 'M' },
  { name: 'Door & Lock Repairs', genderTag: 'M' },
  { name: 'Tiling Repairs', genderTag: 'M' },
  { name: 'Carpentry (Small Jobs)', genderTag: 'M' },
  { name: 'Fence & Gate Repairs', genderTag: 'M' },
  { name: 'Grass Cutting', genderTag: 'M' },
  { name: 'Tree Trimming', genderTag: 'M' },
  { name: 'Gutter Cleaning', genderTag: 'M' },
  { name: 'Roof Cleaning', genderTag: 'M' },
  { name: 'Pest Control / Fumigation', genderTag: 'B' },
  { name: 'Mobile Car Wash', genderTag: 'B' },
  { name: 'Car Detailing', genderTag: 'M' },
  { name: 'Errand Running', genderTag: 'B' },
  { name: 'Delivery Assistance', genderTag: 'M' },
  { name: 'Moving Help (Loading & Offloading)', genderTag: 'M' },
  { name: 'Event Setup & Cleanup', genderTag: 'B' },
  { name: 'Pet Sitting', genderTag: 'B' },
  { name: 'Dog Walking', genderTag: 'B' },
  { name: 'TV Mounting', genderTag: 'B' },
  { name: 'Wi-Fi & Router Setup', genderTag: 'B' },
  { name: 'Computer & Phone Setup', genderTag: 'B' },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Service.deleteMany({});
  const records = services.map((service, index) => ({
    ...service,
    sortOrder: index + 1,
  }));
  await Service.insertMany(records);
  await mongoose.disconnect();
  console.log('Seeded services');
};

run();
