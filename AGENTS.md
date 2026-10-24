<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Lead capture schema

- The registration form collects the applicant's brand, not their location: leads are stored in `public.leads.brand_name`, and `public.leads.city` is deprecated and left null. Give each new form question its own column instead of reusing an old one, so the sheet headings and follow-up reporting stay meaningful.

