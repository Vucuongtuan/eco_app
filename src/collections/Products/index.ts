import { Content } from "@/blocks/(web)/Content/config";
import { MediaBlock } from "@/blocks/(web)/MediaBlock/config";
import { groupCategoriesField } from "@/fields/groupCategories";
import { slugField } from "@/fields/slug";
import { uploadCustomField } from "@/fields/upload";
import { afterReadContent } from "@/hooks/afterReadContent";
import { beforeChangeMetaImage } from "@/hooks/beforeChangeMetaImage";
import { generatePreviewPath } from "@/utilities/generatePreviewPath";
import { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import {
    MetaDescriptionField,
    MetaImageField,
    MetaTitleField,
    OverviewField,
    PreviewField,
} from "@payloadcms/plugin-seo/fields";
import { DefaultDocumentIDType, Where } from "payload";

export const ProductsCollection: CollectionOverride = ({
  defaultCollection,
}) => ({
  ...defaultCollection,
  trash: true,
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ["title", "enableVariants", "_status", "variants.variants"],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === "string" ? data.slug : "",
          collection: "products",
          req,
        });
        return path;
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === "string" ? data.slug : "",
        collection: "products",
        req,
      }),
    useAsTitle: "title",
  },
  hooks: {
    beforeChange: [beforeChangeMetaImage],
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    priceInUSD: true,
    inventory: true,
    meta: true,
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    {
      type: "tabs",
      tabs: [
        {
          fields: [
            {
              name: "subTitle",
              label: {
                vi: "Tiêu đề phụ",
                en: "Sub title",
              },
              type: "textarea",
              required: false,
              localized: true,
            },
            {
              name: "gallery",
              type: "array",
              interfaceName: "ProductGallery",
              minRows: 1,

              fields: [
                uploadCustomField({
                  name: "image",
                  hasMany: true,
                  isGallery: true,
                }),
                {
                  name: "variantOption",
                  type: "relationship",
                  relationTo: "variantOptions",
                  admin: {
                    condition: (data) => {
                      return (
                        data?.enableVariants === true &&
                        data?.variantTypes?.length > 0
                      );
                    },
                  },
                  filterOptions: async ({ data, siblingData, req }) => {
                    if (data?.enableVariants && data?.variantTypes?.length) {
                      // const variantTypeCollection = await req.payload.find({
                      //   collection: "variants",
                      //   where: {
                      //     product: {
                      //       equals: data.id,
                      //     },
                      //   },
                      // });
                      // console.log({
                      //   data: variantTypeCollection.docs[0].options,
                      // });

                      // const a = variantTypeCollection.docs.filter((f) => {
                      //   return f.options.filter(
                      //     (o: any) =>
                      //       o.value.includes("#") ||
                      //       o.value.includes("rgh") ||
                      //       o.value.includes("gh")
                      //   );
                      // });

                      const variantTypeIDs = data.variantTypes.map(
                        (item: any) => {
                          console.log({ item });
                          if (typeof item === "object" && item?.id) {
                            return item.id;
                          }
                          return item;
                        }
                      ) as DefaultDocumentIDType[];

                      if (variantTypeIDs.length === 0)
                        return {
                          variantType: {
                            in: [],
                          },
                        };

                      const query: Where = {
                        variantType: {
                          in: variantTypeIDs,
                        },
                      };
                      console.log({ query });
                      return query;
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    };
                  },
                },
              ],
            },
            {
              name: "shortContent",
              type: "array",
              interfaceName: "ProductShortContent",
              fields: [
                {
                  name: "name",
                  type: "select",
                  required: true,
                  options: [
                    {
                      label: {
                        vi: "Mô tả ngắn",
                        en: "Description",
                      },
                      value: "description",
                    },
                    {
                      label: {
                        vi: "Chất liệu",
                        en: "Material",
                      },
                      value: "material",
                    },
                    {
                      label: {
                        vi: "Kích thước",
                        en: "Size",
                      },
                      value: "size",
                    },
                    {
                      label: {
                        vi: "Khác",
                        en: "Other",
                      },
                      value: "other",
                    },
                  ],
                  defaultValue: "description",
                },
                {
                  name: "content",
                  type: "richText",
                  localized: true,
                  hooks: {
                    afterRead: [afterReadContent],
                  },
                },
              ],
            },
            {
              name: "layout",
              type: "blocks",
              blocks: [Content, MediaBlock],
              localized: true,
            },
          ],
          label: "Content",
        },
        {
          fields: [
            ...defaultCollection.fields,

            {
              name: "relatedType",
              type: "radio",
              options: [
                {
                  label: "Related By Tags & Category",
                  value: "all",
                },
                {
                  label: "Related By Tags",
                  value: "tags",
                },
                {
                  label: "Related By Category",
                  value: "category",
                },
              ],
            },
            {
              name: "relatedByTags",
              type: "relationship",
              relationTo: "tags",
              admin: {
                condition: (_, siblingData) => {
                  return (
                    siblingData?.relatedType === "tags" ||
                    siblingData?.relatedType === "all"
                  );
                },
              },
            },
            {
              name: "relatedByCategory",
              type: "relationship",
              relationTo: "categories",
              admin: {
                condition: (_, siblingData) => {
                  return (
                    siblingData?.relatedType === "category" ||
                    siblingData?.relatedType === "all"
                  );
                },
              },
            },
          ],
          label: "Product Details",
        },
        {
          name: "meta",
          label: "SEO",
          fields: [
            OverviewField({
              titlePath: "meta.title",
              descriptionPath: "meta.description",
              imagePath: "meta.image",
            }),
            MetaTitleField({
              hasGenerateFn: true,
              overrides: {},
            }),
            MetaDescriptionField({
              hasGenerateFn: true,
              overrides: {},
            }),
            MetaImageField({
              relationTo: "media",
              overrides: {},
            }),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: "meta.title",
              descriptionPath: "meta.description",
            }),
          ],
        },
      ],
    },
    {
      name: "taxonomies",
      type: "group",
      interfaceName: "ProductTaxonomies",
      label: { vi: "Phân loại", en: "Taxonomies" },
      admin: { position: "sidebar" },
      fields: [
        ...groupCategoriesField({
          admin: {
            position: "sidebar",
          },
        }),
        {
          name: "tags",
          type: "relationship",
          relationTo: "tags",
          hasMany: true,
        },
      ],
    },
    ...slugField(
      "title",
      {
        slugOverrides: {
          required: true,
        },
      },
      false
    ),
  ],
  versions: {
    drafts: {
      autosave: false,
    },
    maxPerDoc: 30,
  },
});
