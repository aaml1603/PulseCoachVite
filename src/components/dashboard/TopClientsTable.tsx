import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Client {
  id: string;
  name: string;
  email: string;
  complianceRate: number;
  workoutsCompleted: number;
  status: string;
}

interface TopClientsTableProps {
  clients: Client[];
}

const TopClientsTable = ({ clients }: TopClientsTableProps) => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Top Performing Clients</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Workouts</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.email}`}
                        alt={client.name}
                      />
                      <AvatarFallback>
                        {client.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={client.complianceRate}
                      className="w-[60px]"
                    />
                    <span>{client.complianceRate}%</span>
                  </div>
                </TableCell>
                <TableCell>{client.workoutsCompleted}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      client.status === "active" ? "default" : "secondary"
                    }
                  >
                    {client.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopClientsTable;
