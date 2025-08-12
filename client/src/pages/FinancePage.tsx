import { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Card,
  CardContent,
  Divider,
  Paper,
} from "@mui/material";

const FinancePage = () => {
  const [lanes, setLanes] = useState(1);
  const [costPerLane, setCostPerLane] = useState(17.59);
  const [members, setMembers] = useState(2);
  const [boardMembers, setBoardMembers] = useState(2);

  const calculation = useMemo(() => {
    const numLanes = Number(lanes) || 0;
    const costLane = Number(costPerLane) || 0;
    const numMembers = Number(members) || 0;
    const numBoardMembers = Number(boardMembers) || 0;

    if (numLanes === 0 || costLane === 0 || (numMembers + numBoardMembers === 0)) {
      return { totalCost: 0, costPerMember: 0, costPerBoardMember: 0 };
    }

    const totalCost = numLanes * costLane;

    // If there are no regular members, we shouldn't calculate their cost
    if (numMembers === 0) {
      // If there are only board members, they split the cost equally
      const boardMemberCost = numBoardMembers > 0 ? totalCost / numBoardMembers : 0;
      return { totalCost, costPerMember: 0, costPerBoardMember: boardMemberCost };
    }

    // The weighted number of shares. Each member counts as 1.1 shares.
    const weightedShares = (numMembers * 1.1) + numBoardMembers;

    // Cost of a single share (what a board member pays)
    const baseShareCost = totalCost / weightedShares;
    
    // Member's cost is 10% more than the base share
    const memberCost = baseShareCost * 1.1;

    return {
      totalCost: totalCost,
      costPerMember: memberCost,
      costPerBoardMember: baseShareCost,
    };
  }, [lanes, costPerLane, members, boardMembers]);

  return (
    <Box sx={{ py: 8, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" fontFamily="Poppins" fontWeight={700}>
            Finance Calculator
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {/* Input Section */}
          <Grid item xs={12} md={5}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" mb={2} fontWeight={600}>Inputs</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Number of Lanes"
                      type="number"
                      value={lanes}
                      onChange={(e) => setLanes(Number(e.target.value))}
                      fullWidth
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Cost per Lane (€)"
                      type="number"
                      value={costPerLane}
                      onChange={(e) => setCostPerLane(Number(e.target.value))}
                      fullWidth
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Regular Members"
                      type="number"
                      value={members}
                      onChange={(e) => setMembers(Number(e.target.value))}
                      fullWidth
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Board Members"
                      type="number"
                      value={boardMembers}
                      onChange={(e) => setBoardMembers(Number(e.target.value))}
                      fullWidth
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={5}>
            <Card elevation={3} sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h5" mb={2} fontWeight={600}>Results</Typography>
                <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                  <Typography variant="h6" mb={1} fontWeight={500}>
                    Total Cost
                  </Typography>
                  <Typography variant="h4" color="text.primary" fontWeight={700}>
                    €{calculation.totalCost.toFixed(2)}
                  </Typography>
                </Paper>
                
                <Divider sx={{ my: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: "primary.light", color: "primary.contrastText", borderRadius: 2 }}>
                      <Typography variant="body1" mb={1}>
                        Regular Member Pays
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {Number(members) > 0 
                          ? `€${calculation.costPerMember.toFixed(2)}`
                          : "N/A"}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: "secondary.light", color: "secondary.contrastText", borderRadius: 2 }}>
                      <Typography variant="body1" mb={1}>
                        Board Member Pays
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {Number(boardMembers) > 0 
                          ? `€${calculation.costPerBoardMember.toFixed(2)}`
                          : "N/A"}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FinancePage;