import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import path from 'path';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { Categories } from './collections/Categories';
import { EmailSubscribe } from './collections/EmailSubscribe';
import { Media } from './collections/Media';
import { Newsletter } from './collections/Newsletter';
import { Notifications } from './collections/Notifications';
import { Pages } from './collections/Pages';
import { Posts } from './collections/Posts';
import { Reviews } from './collections/Reviews';
import { Screen } from './collections/Screen';
import { Tags } from './collections/Tags';
import { Users } from './collections/Users';
import { defaultLexical } from './fields/defaultLexical';
import { Footer } from './globals/Footer';
import { Header } from './globals/Header';
import { Rate } from './globals/Rate';
import { plugins } from './plugin';


const configEnv = {
  payloadSecret: process.env.PAYLOAD_SECRET || "",
  postgresUrl: process.env.POSTGRES_URL || "",
  baseUrlBlob: process.env.BASE_URL_BLOB || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  postgresUrlNonPooling: process.env.POSTGRES_URL_NON_POOLING || "",
}

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const allCollections = [Users, Media, Categories,Reviews, Newsletter, EmailSubscribe, Pages, Posts,Screen,Notifications,Tags]
const golobalCollections = [Header, Footer,Rate]
const applySearchForCollection = ['categories', 'products',  'posts']
const applySEOForCollection = ['categories', 'products',  'posts', 'pages']

export default buildConfig({
  cors: {
    origins: [
      // Web
      "http://localhost:3000",
      // Mobile
      "http://localhost:8081",
      // Mobile 
      "http://192.168.1.41:8081",
      "**"
    ],
    headers: ["*"],
  },
  // 
  graphQL:{
    disable:false,
    // schemaOutputFile:'./graphql/schema.graphql',
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
    
  },
  
  //
  debug:true,
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/(dashboard)/BeforeLogin#BeforeLogin'],
    },
    dashboard:{
       widgets: [
      {
        slug: 'order-status-summary',
        ComponentPath: '@/components/dashboard/OrderStatusSummary/OrderStatusSummaryServer#OrderStatusSummaryServer',
        label: 'Order Status Summary',
        maxWidth: 'full',
        minWidth: 'large',
      },
      {
        slug: 'revenue-chart',
        ComponentPath: '@/components/dashboard/RevenueChart#RevenueChart',
        label: 'Revenue Chart',
         maxWidth: 'full',
        minWidth: 'large',  
      },
    ],
    },
    user: Users.slug,
  },
  collections: allCollections,
  sharp,
    // Config i18n for CMS
    // i18n: {
    //   fallbackLanguage: "vi",
    //   supportedLanguages: { en, vi },
    // },
    // Config Localization Content
    localization: {
      locales: ['vi', 'en'],
      defaultLocale: 'vi',
      // fallback: true
    },
  // db: vercelPostgresAdapter({
  //   pool: {
  //     connectionString: configEnv.postgresUrlNonPooling
  //   },
    
  // }),
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  editor: defaultLexical({
    headingSizes: ['h1','h2', 'h3', 'h4','h5','h6'],
    enableHeading:true,
    enableTextState:true,
    enableLink:true,
    enableTable:true,
    
  }),
  email: nodemailerAdapter(
    {
    defaultFromAddress: 'info@moon-company.com',
    defaultFromName: 'Moon co.',
    // Nodemailer transportOptions
    transportOptions: {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      auth: {
        user: process.env.EMAIL_USER || "vucuongtuansin1@gmail.com",
        pass: process.env.EMAIL_PASS || "hukt bsal fdvn cqlw",
      },
    },
    },
    
  ),
  endpoints: [],
  globals: golobalCollections,
  plugins: [
    ...plugins,
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

})