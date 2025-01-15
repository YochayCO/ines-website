import EmptyGraphMessage from "../EmptyGraphMessage/EmptyGraphMessage";

export const columnsNoOverlapMessage = <EmptyGraphMessage>
    <b>There are no participants who answered both questions.</b>
    <br />
    Maybe these questions were asked in different versions of the survey, or given to different sectors.
    <br />
    Try exploring other questions.
    We will make this issue easier to avoid in the future.
    <br /><br />
    If you think this is wrong: contact the developer and report the issue
</EmptyGraphMessage>;

export const sectorNoResultMessage = <EmptyGraphMessage>
    <b>The selected search did not result in any data.</b> 
    <br />
    Try clearing filters like sector / special value visiblity toggle.
    Perhaps the selected sector did not answer this question at all. Please verify with the source data.
    <br /><br />
    If you think this is wrong: contact the developer and report the issue
</EmptyGraphMessage>;

export const noResultDefaultMessage = <EmptyGraphMessage>
    <b>The selected search did not result in any data.</b>
    <br />
    Try clearing filters like sector / special value visiblity toggle.
    <br /><br />
    If you think this is wrong: contact the developer and report the issue
</EmptyGraphMessage>;
