import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrSelf } from '@/access/adminOrSelf'
import { publicAccess } from '@/access/publicAccess'
import { checkRole } from '@/access/utilities'

import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'


export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => checkRole(['admin'], user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    group: 'Users',
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
  },
  auth: {
    tokenExpiration: 1209600,
    forgotPassword:{
      generateEmailSubject:async({req}:any)=> {
        const locale = await req.headers.get('Accept-Language');
        return locale !== 'vi' ? 'Reset Password' : 'Đặt lại mật khẩu'
      },
      generateEmailHTML:async({req,user,token}:any)=> {
        const locale = await req.headers.get('Accept-Language');
        const resetUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}`
        return `
          <html lang="en">
            <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${locale !== 'vi' ? 'Reset Password' : 'Đặt lại mật khẩu'}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f0eb;">
            <table class="spacer sp" style="border-collapse: collapse;border-spacing: 0;display: none;padding: 0;text-align: left;vertical-align: top;width: 100%;"><tbody><tr style="padding: 0; text-align: left; vertical-align: top"><td height="30" style="-moz-hyphens: auto;-webkit-hyphens: auto;margin: 0;border-collapse: collapse !important;color: #0a0a0a;font-family: 'Arial', Helvetica, sans-serif;font-size: 5px;font-weight: normal;hyphens: auto;line-height: 30px;margin: 0;mso-line-height-rule: exactly;padding: 0;text-align: left;vertical-align: top;word-wrap: break-word;">&#xA0; </td></tr></tbody></table>
            <table class="spacer pc" style="border-collapse: collapse;border-spacing: 0;padding: 0;text-align: left;vertical-align: top;width: 100%;"><tbody><tr style="padding: 0; text-align: left; vertical-align: top"><td height="30" style="-moz-hyphens: auto;-webkit-hyphens: auto;border-collapse: collapse !important;color: #0a0a0a;font-family: 'Arial', Helvetica, sans-serif;font-size: 10px;font-weight: normal;hyphens: auto;line-height: 30px;margin: 0;mso-line-height-rule: exactly;padding: 0;text-align: left;vertical-align: top;word-wrap: break-word;">&#xA0;</td></tr></tbody></table>
            <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <tr>
            <td style="padding: 40px 30px;">
          <h1 style="color: #A37E2C; font-size: 28px; margin-bottom: 20px; text-align: center;">${locale !== 'vi' ? 'Forgot Your Password?' : 'Quên mật khẩu của bạn?'}</h1>
          <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 30px; text-align: center;">${locale !== 'vi' ? 'Hello' : 'Xin chào'} ${user?.email},</p>
          <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 30px; text-align: center;">${locale !== 'vi' ? 'Click the button below to reset your password.' : 'Nhấn vào nút dưới đây để đặt lại mật khẩu của bạn.'}</p>
          <table cellpadding="0" cellspacing="0" width="100%"><tr><td style="text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #A37E2C; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-size: 16px;">${locale !== 'vi' ? 'Reset Password' : 'Đặt lại mật khẩu'}</a>
            </td></tr></table>
          <p style="color: #666666; font-size: 14px; line-height: 1.5; margin-top: 30px; text-align: center;">If you didn't request a password reset, you can ignore this email.</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
          <p style="color: #666666; font-size: 12px; margin: 0;">&copy; 2025 Moon company. All rights reserved.</p>
            </td>
        </tr>
          </table>
            </body>
            </html>
        `.trim()
      }
    }
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      defaultValue: ['customer'],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      options: [
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'customer',
          value: 'customer',
        },
      ],
    },
    {
      name: 'orders',
      type: 'join',
      collection: 'orders',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'cart',
      type: 'join',
      collection: 'carts',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'addresses',
      type: 'join',
      collection: 'addresses',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id'],
      },
    },
  ],
}
