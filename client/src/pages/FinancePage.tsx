import { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Card,
  CardContent,
  Paper,
} from "@mui/material";

// A small component for the colored result boxes
const ResultBox = ({ title, value, bgColor }: { title: string, value: string, bgColor: string }) => (
  <Grid item xs={12} sm={6}>
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        textAlign: 'center', 
        height: '100%',
        backgroundColor: bgColor,
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>{title}</Typography>
      <Typography variant="h5" fontWeight="bold">
        €{value}
      </Typography>
    </Paper>
  </Grid>
);

const FinancePage = () => {
  // Store inputs as strings to handle comma decimals, with initial values
  const [lanes, setLanes] = useState<string>("1");
  const [costPerLane, setCostPerLane] = useState<string>("17,59");
  const [members, setMembers] = useState<string>("2");
  const [boardMembers, setBoardMembers] = useState<string>("2");

  const calculation = useMemo(() => {
    // Replace comma with dot for calculations
    const numLanes = Number(lanes.replace(',', '.')) || 0;
    const costLane = Number(costPerLane.replace(',', '.')) || 0;
    const numMembers = Number(members.replace(',', '.')) || 0;
    const numBoardMembers = Number(boardMembers.replace(',', '.')) || 0;
    
    const totalPeople = numMembers + numBoardMembers;
    const totalCost = numLanes * costLane;

    if (totalCost === 0 || totalPeople === 0) {
      return { totalCost: 0, costPerMember: 0, costPerBoardMember: 0 };
    }

    // Correct logic: Calculate the fair share first
    const fairShare = totalCost / totalPeople;
    const boardMemberCost = fairShare;
    const memberCost = fairShare * 1.10;

    // The fix is here: return the correct variable name
    return { totalCost, costPerMember: memberCost, costPerBoardMember: boardMemberCost };
  }, [lanes, costPerLane, members, boardMembers]);

  // This calculates the actual total that will be collected
  const totalCollected = (calculation.costPerMember * (Number(members.replace(',', '.')) || 0)) + (calculation.costPerBoardMember * (Number(boardMembers.replace(',', '.')) || 0));

  return (
    <Box sx={{ py: 8, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" fontFamily="Poppins" fontWeight={700}>
            Finance Calculator
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
        </Box>

        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {/* Input Section */}
          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" mb={2}>Inputs</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Number of Lanes" type="text" value={lanes} onChange={(e) => setLanes(e.target.value)} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Cost per Lane (€)" type="text" value={costPerLane} onChange={(e) => setCostPerLane(e.target.value)} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Regular Members" type="text" value={members} onChange={(e) => setMembers(e.target.value)} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Board Members" type="text" value={boardMembers} onChange={(e) => setBoardMembers(e.target.value)} fullWidth />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                <Typography variant="h5" align="center">Results</Typography>
                
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                  {/* Regular Member Box First */}
                  <ResultBox title="Each Regular Member Pays" value={calculation.costPerMember.toFixed(2)} bgColor="primary.main" />
                  {/* Board Member Box Second */}
                  <ResultBox title="Each Board Member Pays" value={calculation.costPerBoardMember.toFixed(2)} bgColor="secondary.main" />
                </Grid>

                <Box sx={{ textAlign: 'center', mt: 'auto' }}>
                  <Typography variant="body1" color="text.secondary">
                    Total Cost: €{calculation.totalCost.toFixed(2)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Collected: €{totalCollected.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FinancePage;