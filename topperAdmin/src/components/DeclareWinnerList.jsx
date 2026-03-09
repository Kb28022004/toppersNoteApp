import {
  Pagination,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Checkbox,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import DepartmentalUsesButton from "./botton/DepartmentalUsesButton";

// Table headings
const tableHeadData = [
  "All",
  "Winner",
  "Tender Name",
  "Bidder Name",
  "City",
  "GST No",
  "Pan No",
  "Mobile No",
  "Email",
  "Payment",
];

// Dummy row data
const dummyData = [
  {
    title: "Construction of Bridge",
    refNumber: "REF123456",
    department: "PWD - Mr. Sharma",
    fees: "₹ 5000",
    startDate: "2025-07-01",
    endDate: "2025-08-01",
    document: "bridge_plan.pdf",
    status: "Draft",
  },
  {
    title: "School Renovation",
    refNumber: "REF987654",
    department: "Education - Mrs. Verma",
    fees: "₹ 2500",
    startDate: "2025-06-15",
    endDate: "2025-07-30",
    document: "school_docs.zip",
    status: "Evolution",
  },
  {
    title: "School Renovation",
    refNumber: "REF987654",
    department: "Education - Mrs. Verma",
    fees: "₹ 2500",
    startDate: "2025-06-15",
    endDate: "2025-07-30",
    document: "school_docs.zip",
    status: "Bidding",
  },

  {
    title: "School Renovation",
    refNumber: "REF987654",
    department: "Education - Mrs. Verma",
    fees: "₹ 2500",
    startDate: "2025-06-15",
    endDate: "2025-07-30",
    document: "school_docs.zip",
    status: "Finalized",
  },
];

const DeclareWinnerList = () => {
  return (
    <DeclareWinnerListMainContainer>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        <WinnerText>Tender Winner Declaration Form
</WinnerText>
<InputFields type="search" name="" id="" placeholder="Search Tender by bidder company name & pan no or GST number" />
      </div>
      <TableContainer component={Paper}>
        <Table sx={{width:"105%"}} >
          <TableHeader>
            <TableRow>
              {tableHeadData.map((title, idx) => (
                <TableHeadCell key={idx}>{title}</TableHeadCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyData.map((item, index) => (
              <TableRow key={index}>
                <TableBodyCell>
                  <Checkbox />
                </TableBodyCell>
                <TableBodyCell sx={{width:"180px"}}>
                  <DepartmentalUsesButton
                    borderColor="#FF8700"
                    variant="text"
                    color='#FFFFFF'
                    textColor='#8F8F8F'
                    text="Declare Winner"
                    component={NavLink}
                    to='/admin/winner-declaration-form'
                  />
                </TableBodyCell>
                <TableBodyCell>{item.department}</TableBodyCell>
                <TableBodyCell>{item.fees}</TableBodyCell>
                <TableBodyCell>{item.startDate}</TableBodyCell>
                <TableBodyCell>{item.endDate}</TableBodyCell>
                <TableBodyCell>
                  <a href="#">{item.document}</a>
                </TableBodyCell>
                <TableBodyCell>
                  <StatusText status={item.status}>{item.status}</StatusText>
                </TableBodyCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <LastSection>
        <p>Showing 1 to {dummyData.length} entries</p>
        <Pagination count={5} color="primary" />
      </LastSection>
    </DeclareWinnerListMainContainer>
  );
};

export default DeclareWinnerList;

const DeclareWinnerListMainContainer = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
}));




const LastSection = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});


const TableHeader = styled(TableHead)({
  backgroundColor: "#E4EEF6",
});

const TableHeadCell = styled(TableCell)({
  fontSize: "14px",
  fontWeight: 500,
  fontFamily: "Roboto",
  color: "#000000",
});
const WinnerText = styled("p")({
  fontSize: "14px",
  fontWeight: 500,
  fontFamily: "Manrope",
  color: "#404040",
});
const TableBodyCell = styled(TableCell)({
  fontSize: "13px",
  fontWeight: 400,
  fontFamily: "Roboto",
  color: "#8F8F8F",
});


const StatusText = styled("span")(({ status }) => ({
  fontWeight: 600,
  color: status === "Open" ? "green" : "red",
}));

const InputFields = styled("input")({
  fontSize: "14px",
  fontWeight: 400,
  fontFamily: "Manrope",
  color: "#ADADBD",
  lineHeight: "100%",
  height: "40px",
  border: "1px solid #E4E7EB",
  borderRadius: "5px",
  padding: "8px 20px",
  "&:focus": {
    outline: "none",
  },
});