import { Field } from "payload";

export const groupCategoriesField = ({
  admin = {},
}: {
  admin?: Field["admin"];
}): Field[] => {
  return [
    {
      name:"gender",
      type:"select",
      options:[
        {
          label:"Nam",
          value:"men"
        },
        {
          label:"Nữ",
          value:"women"
        },
      ],
      required:true,
      ...(admin && admin),
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      hasMany: true,
      filterOptions: ({ siblingData }) => {
        // category filter slug 
        // vd : "men-shirts", 'women-shirts'
        // ta sẽ filter chỉ chọn theo field gender
        console.log({siblingData})
        const gender = (siblingData as { gender?: string })?.gender;
        return {
          slug: {
            like: gender ? `${gender}-` : "",
          },
        }
      },
      admin:{

        ...(admin as any),
        condition: (_, siblingData) => !!(siblingData as { gender?: string })?.gender,
      }
    },
 
  ];
};
