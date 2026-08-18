import { adminGraphql } from "./shopify.ts";

type Definition = {
  type: string;
  name: string;
  displayNameKey: string;
  fieldDefinitions: Array<{ key: string; name: string; type: string; validations?: Array<{ name: string; value: string }> }>;
};

const definitions: Definition[] = [
  {
    type: "home_featured_link", name: "Featured link", displayNameKey: "title",
    fieldDefinitions: [
      { key: "title", name: "Title", type: "single_line_text_field" },
      { key: "url", name: "URL", type: "url" },
    ],
  },
  {
    type: "home_featured_section", name: "Featured section", displayNameKey: "title",
    fieldDefinitions: [
      { key: "title", name: "Title", type: "single_line_text_field" },
      { key: "image", name: "Image", type: "file_reference" },
      { key: "links", name: "Links", type: "list.single_line_text_field" },
    ],
  },
  {
    type: "home_card", name: "Card", displayNameKey: "title",
    fieldDefinitions: [
      { key: "title", name: "Title", type: "single_line_text_field" },
      { key: "image", name: "Image", type: "file_reference" },
      { key: "category", name: "Category", type: "collection_reference" },
    ],
  },
  {
    type: "home_card_grid", name: "Card grid", displayNameKey: "title",
    fieldDefinitions: [
      { key: "title", name: "Title", type: "single_line_text_field" },
      { key: "cards", name: "Cards (max 4)", type: "list.single_line_text_field" },
    ],
  },
  {
    type: "home_content_section", name: "Content section", displayNameKey: "title",
    fieldDefinitions: [
      { key: "title", name: "Title", type: "single_line_text_field" },
      { key: "description", name: "Description", type: "multi_line_text_field" },
      { key: "background_image", name: "Background image", type: "file_reference" },
      { key: "link_label", name: "Link label", type: "single_line_text_field" },
      { key: "link", name: "Link", type: "url" },
    ],
  },
];

const query = `query HomeDefinitions { metaobjectDefinitions(first: 100) { nodes { id type } } }`;
const mutation = `
  mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition { id type }
      userErrors { field message }
    }
  }
`;

type State = { metaobjectDefinitions: { nodes: Array<{ id: string; type: string }> } };
type Result = { metaobjectDefinitionCreate: { metaobjectDefinition: { id: string; type: string } | null; userErrors: Array<{ field: string[]; message: string }> } };

const state = await adminGraphql<State>(query, {});
const existing = new Map(state.metaobjectDefinitions.nodes.map((item) => [item.type, item.id]));
for (const definition of definitions) {
  if (existing.has(definition.type)) {
    console.log(`Exists: ${definition.type}`);
    continue;
  }
  const fieldDefinitions = await Promise.all(definition.fieldDefinitions.map(async (field) => {
    if (!field.validations?.some((validation) => validation.name === "metaobject_type")) return field;
    const targetType = field.validations.find((validation) => validation.name === "metaobject_type")!.value;
    const targetId = existing.get(targetType);
    if (!targetId) throw new Error(`Missing referenced definition: ${targetType}`);
    return { ...field, validations: [{ name: "metaobject_definition_id", value: targetId }] };
  }));
  const result = await adminGraphql<Result>(mutation, { definition: { ...definition, ownerType: "MERCHANT", fieldDefinitions } });
  const errors = result.metaobjectDefinitionCreate.userErrors;
  if (errors.length) {
    if (errors.some((error) => /already been taken/i.test(error.message))) {
      console.log(`Exists: ${definition.type}`);
      continue;
    }
    throw new Error(`${definition.type}: ${JSON.stringify(errors)}`);
  }
  console.log(`Created: ${definition.type}`);
}
